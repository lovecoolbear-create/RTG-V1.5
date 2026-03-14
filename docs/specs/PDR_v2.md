# ReadyToGo 首页行程驱动 PDR V2

## 1. 文档说明

- 本文是 [PDR.md](file:///Users/blair/ReadyToGo-wechat/docs/specs/PDR.md) 的 V2 增补版本。
- 目标是把已确认的户外与商务需求收敛成可执行范围。
- 本版本先定义业务规则与交互边界，不涉及具体技术实现细节。

## 2. V2 变更摘要

### 2.1 范围新增

- 模板库新增三类户外模板：
  - 户外滑雪
  - 户外徒步
  - 户外骑行
- 新建日程/快速出发支持商务最小字段：
  - 目的地
  - 关键时间
  - 证件类型
- 支持同日多段行程，且每段行程独立清点、独立状态迁移。

### 2.2 范围移除

- 不做“复制同类行程”能力。
- 同类需求通过“选择已有模板”满足。

### 2.3 范围澄清

- 报销资料核对不纳入当前小程序核心流程。
- 户外提醒为轻提示，不阻断出发流程。

## 3. V2 业务目标

- 在不增加首页复杂度的前提下，提升户外与商务场景适配度。
- 保持“模板驱动 + 清单可编辑 + 状态机统一”核心架构不变。
- 通过同日多段行程支持，覆盖用户高频复合出行场景。

## 4. 核心对象增补

### 4.1 Trip 字段增补

在 V1 字段基础上，新增：

- destination：目的地
- keyTime：关键时间（如会议时间/出发集合时间）
- idType：证件类型（身份证/护照/其他）
- scheduleTime：行程时段时间（用于同日多段排序）

### 4.2 Template 字段增补

- category：模板类别（outdoor/business/general）
- reminderRules：可选提醒规则集合（如证件提醒）

## 5. 流程增补

### 5.0 首页入口职责边界

1. “快速出发”按钮仅用于创建 `temporary` 来源行程卡片。
2. “新建日程”按钮仅用于创建 `planned` 来源行程并同步到对应日期。
3. 任一行程创建完成后，后续操作统一由“点击行程卡片”触发。
4. 顶部两个按钮不直接承担清点、出发、返程、归档等后续动作入口。

### 5.1 户外模板流程

1. 用户在新建/快速出发选择户外模板（滑雪/徒步/骑行）。
2. 进入清点流程，清单可增删改。
3. 点击“清点完成”后，弹出轻提醒：
   - 示例：是否已携带身份证/应急药品/充电设备？
4. 用户可直接继续，不阻断“现在出发/稍后出发”决策。

### 5.2 商务字段流程

1. 新建日程或快速出发时展示商务字段入口。
2. 目的地、关键时间、证件类型支持填写与编辑。
3. 未填写时允许继续，但在“现在出发”前给轻提示。

### 5.3 同日多段流程

1. 同一天允许创建多个行程卡片。
2. 卡片按 scheduleTime 升序排列；无时间项排在末尾。
3. 每个行程卡片独立走状态机：
   - preparation -> packing -> packed/departed -> returnPhase
4. 任一行程返程完成，仅迁移该卡片到“待归档”，不影响同日其他行程。

## 6. 状态与交互规则补充

- 行程卡片是唯一的后续操作入口，交互由卡片状态决定。
- preparation / packing：点击卡片进入出发清点，允许增删改清单。
- packed：点击卡片进入“修改清单 / 现在出发”二选一决策。
- departed：点击卡片进入“开始返程清点”确认，确认后进入返程清点。
- returnPhase：点击卡片继续返程清点；完成后迁移到待归档列表。
- archived：卡片不再出现在“计划中的行程”，仅在历史/归档区域查看。

## 7. 提醒规则补充

- 户外模板触发轻提醒：
  - 证件检查
  - 应急药品检查
  - 电源设备检查
- 商务字段缺失触发轻提醒：
  - 目的地缺失
  - 关键时间缺失
  - 证件类型缺失
- 以上提醒均为非阻断提示。

## 8. 一期交付范围（V2 Scope）

- 户外三类模板接入模板库
- 户外模板清点完成轻提醒
- 商务最小字段接入新建/快速出发
- 同日多段行程能力
- 同日多段独立状态迁移与独立归档

## 9. 不做项（V2 Out of Scope）

- 复制同类行程
- 报销资料核对
- 企业审批流
- 行程协同与多人共享

## 10. 验收标准（V2）

- 用户可从模板库选择三类户外模板并正常完成清点流程。
- 户外模板在清点完成后出现轻提醒，且不阻断后续操作。
- 新建与快速出发支持填写商务字段，并可被保存到行程卡片。
- “快速出发”“新建日程”仅负责创建行程，不直接承载后续清点/出发动作。
- 行程创建后，清点、修改、出发、返程均通过点击对应行程卡片触发。
- 同一天创建多段行程后，首页可正确排序展示。
- 每段行程状态与归档迁移互不干扰。
- 返程完成仅迁移当前行程卡片到待归档。

## 11. 字段级事件表（V2）

### 11.1 统一约定

- 每个事件统一包含：eventId、occurredAt、tripId、sourcePage、operator。
- eventId 要求全局唯一，用于去重与问题回放。
- occurredAt 使用本地时间戳，精度到毫秒。
- operator 固定为 currentUser，后续如支持协同可扩展。

### 11.2 事件清单

| 事件名 | 触发时机 | 必填字段 | 可选字段 | 状态影响 | 失败处理 |
|---|---|---|---|---|---|
| onTripCreated | 点击“快速出发”或“新建日程”并确认创建卡片 | tripId, title, source, date, templateId | destination, keyTime, idType, scheduleTime | 初始化为 preparation | 阻止创建并提示缺少基础字段 |
| onTemplateSelected | 在创建页或清单页确认模板 | tripId, templateId, templateCategory | reminderRules | 更新 trip.templateId | 保持原模板并提示选择失败 |
| onChecklistSessionStarted | 进入出发/返程清单页时 | tripId, mode, checklistSessionId | snapshotVersion | preparation->packing 或 departed->returnPhase | 回退首页并提示会话创建失败 |
| onChecklistItemAdded | 清单中新增条目时 | tripId, checklistSessionId, itemId, itemText | itemGroup | 不改状态，更新 snapshot | 保留原列表并提示新增失败 |
| onChecklistItemUpdated | 清单中修改条目时 | tripId, checklistSessionId, itemId, newItemText | oldItemText | 不改状态，更新 snapshot | 回退到旧值并提示修改失败 |
| onChecklistItemRemoved | 清单中删除条目时 | tripId, checklistSessionId, itemId | itemText | 不改状态，更新 snapshot | 还原该项并提示删除失败 |
| onChecklistCompleted | 点击清点完成时 | tripId, checklistSessionId, mode, completionRate | outdoorReminderShown, businessReminderShown | 保持 packing/returnPhase，等待用户决策 | 保持当前页面并提示完成失败 |
| onDepartDecisionMade | 清点完成后选择现在出发或稍后出发 | tripId, decision(nowDepart/laterDepart) | missingBusinessFields | nowDepart->departed, laterDepart->packed | 保持 packing 并要求重新选择 |
| onReturnCompleted | 返程清点确认完成时 | tripId, checklistSessionId | archiveCandidate=true | returnPhase->待归档列表 | 保持 returnPhase 并提示稍后再试 |
| onAlarmUpdated | 点击铃铛设置或关闭提醒时 | tripId, alarmEnabled | alarmTime | 不改行程状态，仅改提醒字段 | 保持旧提醒设置并提示失败 |

### 11.3 字段字典补充

- source：planned | temporary。
- mode：departure | return。
- templateCategory：outdoor | business | general。
- decision：nowDepart | laterDepart。
- completionRate：0~1，最小保留两位小数。
- missingBusinessFields：destination/keyTime/idType 的缺失键集合。

### 11.4 同日多段一致性规则

- 所有事件必须绑定明确 tripId，不允许以 date 作为唯一定位条件。
- 同一日期下多个 trip 的事件流互不影响，不允许跨 trip 写入 snapshot。
- onReturnCompleted 仅迁移当前 trip，不触发同日其他 trip 的列表变化。

### 11.5 校验清单

- 创建同日三段行程后，分别进入清单编辑，三段 snapshot 不串写。
- 第一段选择现在出发后，第二段仍可保持 preparation 或 packing。
- 第三段完成返程后，仅第三段迁移到待归档。
- 户外模板完成清点时出现轻提醒，不阻断 decision 事件提交。
- 商务字段缺失时给轻提示，但 laterDepart 与 nowDepart 均可提交。

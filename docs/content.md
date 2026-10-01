网站定位
数据新闻单页。首页封面与完整文章正文位于同一纵向滚动页面；图表作为论据穿插其中，通过线性阅读和滚动叙事，呈现“老年人就医困境—陪诊行业出现—行业规范发展”的完整逻辑。
文章结构
1. 导语
   郑玉霞独自就医五小时的故事；解释“数字迷宫”的现实。以人物叙事为主，不放正式统计图表。
2. 老龄化双重现实
   老年人口增长、空巢家庭扩大、慢性病与异地就医需求增长。
3. 数字门槛
   智慧医疗便利与老年人数字能力之间的落差；子女难以陪同、独居老人缺少支持。
4. 陪诊行业应运而生
   介绍陪诊服务流程、服务对象、行业规模、公众态度与陪诊师的多重角色。
5. 陪诊赛道下半场
   平台与资本进入、行业问题、服务标准与政策规范。
6. 结尾
   回到郑玉霞，提出医院适老化、保留人工窗口、完善陪诊规范等方向，以“让走得慢的人不被落下”收束。
图表清单
初版严格制作以下 5 张图表，不合并、不扩展。
| 编号 | 位置 | 类型 | 数据文件 | 结论 |
|---|---|---|---|---|
| 图表 01 | 第二章“老龄化双重现实”开头，老年人口增长段落后 | 双轴折线图 | `elderly_population_2016_2025.csv` | 2016—2025年，65岁及以上人口规模和占总人口比重持续增长，2025年占比达到15.9%。 |
| 图表 02 | 第二章，空巢家庭段落后 | 分组柱状图 + 占比折线 | `empty_nest_households_2000_2020.csv` | 2000—2020年，夫妻与独居空巢老年家庭均明显增长，达到四成老年家庭为空巢家庭。 |
| 图表 03 | 第三章“数字门槛”，解释智慧医疗障碍后 | 使用比例图 | `elderly_smartphone_usage.csv` | 老年人智能手机使用仍有缺口，数字医疗流程可能成为就医障碍。 |
| 图表 04 | 第四章“陪诊行业应运而生”开头 | 横向流程图 | `accompaniment_service_flow.json` | 陪诊并非单一陪同，而是覆盖预约、挂号、问诊、检查、取药和家属反馈的完整服务流程。 |
| 图表 05 | 第五章“陪诊赛道下半场” | 平台行动时间线 | `accompaniment_industry_timeline.csv` | 陪诊行业的平台探索与入局轨迹。 |

数据占位约定
- 初版仅使用 `public/data/` 中现有字段渲染，不补齐缺失数据。
- 每张图表的“数据来源”和“单位”统一展示为“待补”，不阻塞开发。
- 图表 04 仅展示现有数据中的挂号、问诊、检查三步；文章正文结论保持不改。
- 图表 05 仅展示平台线；政策线不纳入初版图表。

数据文件字段
elderly_population_2016_2025.csv
year, elderly_population, elderly_population_share

empty_nest_households_2000_2020.csv
year, couple_empty_nest_households, solo_empty_nest_households, empty_nest_share

elderly_smartphone_usage.csv
indicator, value, unit, source

accompaniment_service_flow.json
step, title, description, icon

accompaniment_industry_timeline.csv
date, category, title, description, source

初版范围外
文章中的其余图位暂不制作，不纳入本轮数据与开发范围。

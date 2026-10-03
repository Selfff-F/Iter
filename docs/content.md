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
## 图表清单

| 编号 | 位置 | 类型 | 数据文件 | 布局 | 来源 | 单位 | 结论 |
|---|---|---|---|---|---|---|---|
| 图表 01 | 第二章 老龄化双重现实开头 | 双轴折线图 | `elderly_population_2016_2025.csv` | full | 民政部全国老龄办《2025年度国家老龄事业发展公报》 | 万人 / % | 2016—2025年，65岁及以上人口规模和占比持续增长，2025年占比达15.9% |
| 图表 02 | 第二章 空巢家庭段落后 | 分组柱状 + 占比折线 | `empty_nest_households_2000_2020.csv` | split | 人口研究《中国老年家庭空巢化态势与空巢老年群体基本特征》 | 万户 / % | 2000—2020年夫妻与独居空巢家庭均明显增长，合计占老年家庭43.56% |
| 图表 03 | 第二章 慢性病段落后 | 柱状图 | `chronic_disease.csv` | full | 中华流行病学杂志《中国老年人群慢性病患病状况和疾病负担研究》（截止2016年） | % | 老年人群主要慢性病患病率高，高血压达58.3% |
| 图表 04 | 第二章 就医年龄结构 | 环形图 | `elderly_age_structure.csv` | full | 中国老龄协会《老年人就医时空大数据分析报告》（2024.10–2025.9） | % | 就医老年人以60—64岁低龄老人为主，占46.7% |
| 图表 05 | 第二章 跨区就医 | 柱状图 | `cross_region_medical.csv` | full | 中国老龄协会《老年人就医时空大数据分析报告》（2024.10–2025.9） | 万人次 / % | 跨区就医合计1846.5万人次，占16% |
| 图表 06 | 第三章 数字门槛 | 子母饼图 | `elderly_smartphone_usage.csv` | full | 《第五次中国城乡老年人生活状况抽样调查基本数据公报》（截止2021年） | % | 超六成未使用智能手机；使用者中深度应用比例明显偏低 |
### 图表 06 说明
- 数据文件：`elderly_smartphone_usage.csv`
- 左环（全体老人）：会使用 36.6%、不会使用 40.4%、没有 23.0%
- 右环（会用智能手机的人中）：网络聊天 74.7%、手机支付 18.1%、预约挂号 9.6%、网约车 7.1%
- 注意：左右两环口径不同，不要合并计算

| 图表 07 | 第四章 陪诊行业开头 | 横向流程图 | `accompaniment_service_flow.json` | split | — | — | 陪诊是覆盖预约、接诊、陪诊、结束的完整服务流程 |
| 图表 08 | 第四章 需求对象 | 环形图 | `service_users_ratio.csv` | full | 《2025-2026中国陪诊助医行业白皮书》 | % | 60岁以上与异地跨城患者合计占73% |
| 图表 09 | 第四章 企业分布 | 中国地图（大区上色） | `company_distribution.csv` | full | 商启产业研究院《2025陪诊行业研究报告》 | % | 东北、华东、华北合计近65%，按大区近似 |
| 图表 10 | 第五章 下半场 | 时间线 | `accompaniment_industry_timeline.csv` | full | 新浪财经、钛媒体 | — | 陪诊行业的平台探索与入局轨迹，2015—2025 |
| 图表 11 | 结尾 友善医疗 | 水平条形图 | `friendly_medical_suggestions.csv` | full | 《2024老年友善医疗微改造需求洞察报告》 | % | 老年人希望医院智慧终端降低使用门槛、主动适配老年需求 |

## 数据文件字段

```text
elderly_population_2016_2025.csv
year, elderly_population, elderly_population_share

empty_nest_households_2000_2020.csv
year, couple_empty_nest_households, solo_empty_nest_households, empty_nest_share

chronic_disease.csv
disease, rate

elderly_age_structure.csv
age_group, ratio

cross_region_medical.csv
type, visits, ratio

elderly_smartphone_usage.csv
indicator, value, unit, source

accompaniment_service_flow.json
step, title, description, icon

service_users_ratio.csv
type, ratio

company_distribution.csv
region, ratio

accompaniment_industry_timeline.csv
date, category, title, description, source

friendly_medical_suggestions.csv
suggestion, ratio
初版范围外
文章中的其余图位暂不制作，不纳入本轮数据与开发范围。

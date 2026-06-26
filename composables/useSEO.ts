// SEO 工具：注入 JSON-LD 与动态 head
export function useWebAppSEO() {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: '取名神器 - 中文网名生成器',
          alternateName: 'Chinese Name Generator',
          url: 'https://namegen.apppss.com/',
          image: 'https://namegen.apppss.com/og-image.svg',
          description:
            '免费中文网名生成器：基于音韵评分与主题词库，生成 2-4 字音韵优美、字形讲究、有诗词典故寓意的中文网名。完全本地处理，无需注册，保护隐私。',
          applicationCategory: 'UtilitiesApplication',
          applicationSubCategory: 'Name Generator',
          operatingSystem: 'Any (Web Browser)',
          browserRequirements: 'Requires JavaScript',
          inLanguage: 'zh-CN',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'CNY'
          },
          featureList: [
            '本地生成，零上传',
            '6 维音韵评分',
            '6 大主题词库',
            'AI 增强（可选）',
            '支持 2/3/4 字名',
            '可调节风格：通用/文艺/豪迈/清新/二次元'
          ],
          audience: {
            '@type': 'PeopleAudience',
            audienceType: '中文用户、自媒体创作者、跨境电商、游戏玩家、二次元爱好者'
          },
          creator: {
            '@type': 'Organization',
            name: '取名神器',
            url: 'https://namegen.apppss.com/'
          }
        })
      },
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: '如何用取名神器生成中文网名',
          description: '三步生成音韵优美、有寓意的中文网名',
          step: [
            {
              '@type': 'HowToStep',
              name: '输入描述',
              text: '在「描述你的名字气质」一栏输入一段简短描述，如「跨境电商」「二次元手游玩家的昵称」「清新文艺的女生网名」。'
            },
            {
              '@type': 'HowToStep',
              name: '选择参数',
              text: '选择字数（2/3/4 字）、风格（通用/文艺/豪迈/清新/二次元）、数量（10/20 个）。'
            },
            {
              '@type': 'HowToStep',
              name: '生成与复制',
              text: '点击「生成网名」，从结果中挑选喜欢的名字并点击复制按钮。'
            }
          ],
          totalTime: 'PT30S'
        })
      },
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: '这个网名生成器是免费的吗？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '完全免费，核心生成功能在浏览器本地完成，无需注册，无任何费用。AI 增强是可选功能。'
              }
            },
            {
              '@type': 'Question',
              name: '生成的名字会重复吗？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '不会。我们基于 200+ 精选美字与多套模板组合，算法会做去重与多样性控制。'
              }
            },
            {
              '@type': 'Question',
              name: '网名生成器如何保证音韵好听？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '我们采用 6 维音韵评分体系：声调起伏（25%）、押韵（20%）、平仄（15%）、字形（10%）、寓意（20%）、易读性（10%）。'
              }
            },
            {
              '@type': 'Question',
              name: '我的描述会被上传到服务器吗？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '不会。所有运算都在浏览器内进行，不使用 Cookie 做用户追踪。'
              }
            },
            {
              '@type': 'Question',
              name: '支持哪些类型的网名？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '目前支持中文 2-4 字名，覆盖电商、科技、文艺、二次元、山水自然等场景。'
              }
            },
            {
              '@type': 'Question',
              name: '生成的名字可以商用吗？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '可以。基于通用汉字组合，无版权限制。但建议使用前查询商标与平台可用性。'
              }
            },
            {
              '@type': 'Question',
              name: '如何让 AI 增强生成更准？',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '在「描述你的名字气质」一栏写得更具体（行业、目标用户、想传达的情绪），效果更好。AI 增强会以你本地生成的 Top 5 作为「风格种子」进行二次创作。'
              }
            }
          ]
        })
      }
    ]
  })
}

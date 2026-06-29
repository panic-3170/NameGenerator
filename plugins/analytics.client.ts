export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  if (config.public.env === 'production') {
    const script = document.createElement('script')
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    const inlineScript = document.createElement('script')
    inlineScript.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    `
    document.head.appendChild(inlineScript)
  }
})

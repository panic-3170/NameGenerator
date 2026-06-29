export function generateAvatar(name: string, size: number = 128): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const colors = [
    '#a8323a', '#4a6670', '#c63d2f', '#3d5a40',
    '#7a4d7e', '#2c5f7c', '#6b4e46', '#3e6d7e'
  ]

  const char = name.charAt(name.length - 1)
  const hash = char.charCodeAt(0)
  const bgColor = colors[hash % colors.length]
  const fontSize = size * 0.55

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)

  const gradient = ctx.createRadialGradient(
    size * 0.3, size * 0.3, 0,
    size * 0.5, size * 0.5, size * 0.7
  )
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = '#ffffff'
  ctx.font = `600 ${fontSize}px "STKaiti", "KaiTi", serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(char, size / 2, size / 2)

  return canvas.toDataURL('image/png')
}

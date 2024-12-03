import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fertilizing Smart',
    short_name: 'Fertilizing Smart',
    description: 'An application that helps to apply just appropriate amount of fertilizer to the soil, in hope to manage the Nitrogen cycle and reduce the environmental impact of agriculture.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
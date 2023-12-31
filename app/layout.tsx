import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//     title: 'Blackjack!',
//     description: 'Online Blackjack games for you and your friends!',
// }

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <Head>
                <title>Blackjack!</title>
                <meta name="description">Online Blackjack games for you and your friends!</meta>
                <meta property='og:title' content='Blackjack!' />
                <meta property='og:description' content='Online Blackjack games for you and your friends!' />
                <meta property='og:image' content={process.env.NEXT_PUBLIC_BASE_URL + "/link_image.jpg"} />
                <meta property='og:url' content={process.env.NEXT_PUBLIC_BASE_URL} />
            </Head>

            <body className={inter.className}>{children}</body>
        </html>
    )
}

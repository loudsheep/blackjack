import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    metadataBase: new URL(process.env.BASE_PATH ?? ""),
    title: 'Blackjack!',
    description: 'Online Blackjack games for you and your friends!',
    openGraph: {
        title: 'Blackjack!',
        description: 'Online Blackjack games for you and your friends!',
        images: process.env.BASE_PATH + "/link_image.jpg",
        url: process.env.BASE_PATH
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Blackjack!',
        description: 'Online Blackjack games for you and your friends!',
        images: process.env.BASE_PATH + "/link_image.jpg",
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    )
}

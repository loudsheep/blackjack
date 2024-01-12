import CommonLayout from '@/components/CommonLayout'
import Contributors from '@/components/Contributors'
import React from 'react'

export default function AboutPage() {
    return (
        <CommonLayout>
            <Contributors url={process.env.GITHUB_REPO_API_URL ?? ""}></Contributors>
        </CommonLayout>
    )
}

'use client'

import React from 'react';
import { MaintenanceMode } from '@/shared/components/ui/MaintenanceMode';
import { Button } from '@/shared/components/ui/Button';
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <MaintenanceMode
            title="404 - Page Not Found"
            description="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
            showContactSupport={false}
            status="Not Found"
            icon={<FileQuestion className="w-12 h-12 text-accent-blue" strokeWidth={1.5} />}
            customAction={
                <Link href="/" passHref>
                    <Button variant="primary">
                        Return Home
                    </Button>
                </Link>
            }
        />
    );
}

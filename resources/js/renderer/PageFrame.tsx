import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useRender } from './context';

/** One fixed-size sheet of paper. Templates place their layout inside it. */
export function PageFrame({
    index,
    className,
    children,
}: {
    index: number;
    className?: string;
    children: ReactNode;
}) {
    const { design } = useRender();

    return (
        <div
            className={cn('cv-page', className)}
            data-page={index + 1}
            data-background={design.background}
        >
            {children}
        </div>
    );
}

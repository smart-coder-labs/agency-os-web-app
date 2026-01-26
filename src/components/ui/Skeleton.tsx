"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800/40",
                className
            )}
            {...props}
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-700/30 to-transparent"
                initial={{ translateX: "-100%" }}
                animate={{ translateX: "100%" }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                }}
            />
        </div>
    );
}

export { Skeleton };

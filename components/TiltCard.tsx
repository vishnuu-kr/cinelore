import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', glowColor = "rgba(255, 255, 255, 0.4)" }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseXRel = e.clientX - rect.left;
        const mouseYRel = e.clientY - rect.top;

        const xPct = (mouseXRel / width) - 0.5;
        const yPct = (mouseYRel / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`relative transition-transform duration-200 ease-out ${className}`}
        >
            <div
                style={{
                    transform: "translateZ(20px)",
                    transformStyle: "preserve-3d",
                }}
                className="relative w-full h-full"
            >
                {children}
            </div>

            {/* Gloss Reflection */}
            <motion.div
                style={{
                    opacity: useTransform(mouseY, [-0.5, 0, 0.5], [0, 0.3, 0]),
                    background: `linear-gradient(180deg, transparent 0%, ${glowColor} 100%)`,
                    rotateX: rotateX,
                    rotateY: rotateY,
                    zIndex: 10
                }}
                className="absolute inset-0 rounded-2xl pointer-events-none mix-blend-overlay"
            />
        </motion.div>
    );
};

export default TiltCard;

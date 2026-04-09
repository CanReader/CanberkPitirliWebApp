import { motion } from "framer-motion";

const LoadingScreen = ({ onComplete }) => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 1.8, ease: "easeInOut" }}
            onAnimationComplete={onComplete}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#121212",
            }}
        >
            {/* Pulsing ring */}
            <motion.div
                style={{
                    position: "absolute",
                    width: 112,
                    height: 112,
                    borderRadius: "50%",
                    border: "2px solid rgba(49, 130, 206, 0.3)",
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.4, 1.4], opacity: [0, 0.5, 0] }}
                transition={{ duration: 1.6, ease: "easeOut" }}
            />

            {/* Name reveal */}
            <motion.div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <motion.h1
                    style={{
                        color: "#FAF7F2",
                        fontSize: "clamp(1.8rem, 4vw, 2.25rem)",
                        fontWeight: 800,
                        letterSpacing: "0.05em",
                        margin: 0,
                    }}
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    Canberk Pitirli
                </motion.h1>

                {/* Animated underline */}
                <motion.div
                    style={{
                        height: 3,
                        backgroundColor: "#3182CE",
                        borderRadius: 9999,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: 160 }}
                    transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                />

                <motion.p
                    style={{
                        color: "#57556C",
                        fontSize: "0.875rem",
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        marginTop: 4,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                >
                    Software Developer
                </motion.p>
            </motion.div>

            {/* Loading dots */}
            <div style={{ display: "flex", gap: 6, marginTop: 32 }}>
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: "#9ca3af",
                        }}
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                            duration: 0.8,
                            repeat: 2,
                            delay: 0.3 + i * 0.15,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default LoadingScreen;

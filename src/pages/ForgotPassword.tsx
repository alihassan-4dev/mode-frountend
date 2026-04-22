import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Email-based reset is not used; signed-in users can change password in Settings. */
const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary glow-purple mb-4"
          >
            <Brain className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-display font-bold text-foreground">Password help</h1>
          <p className="text-muted-foreground mt-2 text-sm px-2">
            This app does not send reset emails. Sign in and update your password from{" "}
            <span className="text-foreground font-medium">Settings</span>, or ask an administrator if you are locked
            out.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8 text-center space-y-4">
          <Button asChild className="w-full">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

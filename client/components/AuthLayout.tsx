import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

/**
 * The dark EFKT brand panel: wordmark, tagline, and a "welcome" pill over the
 * Delft-blue surface with decorative rings. Presentational only.
 */
function BrandPanel({ badge }: { badge: string }) {
  return (
    <Box
      sx={{
        position: "relative",
        width: { xs: "100%", md: "44%" },
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        p: 5.5,
        color: "common.white",
        bgcolor: "efkt.delftBlue",
        overflow: "hidden",
      }}
    >
      <Typography
        component="span"
        sx={{ fontWeight: 700, fontSize: 22, letterSpacing: "0.04em" }}
      >
        EFKT
      </Typography>

      <Box sx={{ mt: "auto", position: "relative", zIndex: 2 }}>
        <Typography
          sx={{
            fontSize: 38,
            lineHeight: 1.08,
            fontWeight: 100,
            letterSpacing: "-0.015em",
            maxWidth: 320,
          }}
        >
          Less corporate.
          <br />
          <Box component="b" sx={{ fontWeight: 600 }}>
            More proptech.
          </Box>
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.5,
            mt: 3.5,
            pl: 1,
            pr: 2.75,
            py: 1,
            borderRadius: 999,
            bgcolor: "rgba(255,255,255,0.10)",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f0c374, #fbe9c9)",
              boxShadow: (theme) =>
                `inset 0 0 0 2px ${theme.palette.efkt.vermilion}`,
            }}
          />
          {badge}
        </Box>
      </Box>

      {/* Decorative rings */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          right: -130,
          bottom: -130,
          width: 360,
          height: 360,
          border: "1px solid rgba(255,255,255,0.22)",
          borderRadius: "50%",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          right: -70,
          bottom: -70,
          width: 240,
          height: 240,
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: "50%",
        }}
      />
    </Box>
  );
}

export interface AuthLayoutProps {
  /** Text shown in the brand-panel pill (e.g. "Welcome back to the platform"). */
  badge: string;
  /** The form panel content. */
  children: ReactNode;
}

/**
 * EFKT split-panel auth card: dark brand panel + white form panel, centered on
 * the anti-flash page surface. Shared by the login and register screens so the
 * card chrome lives in exactly one place.
 */
export function AuthLayout({ badge, children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        p: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          width: "100%",
          maxWidth: 940,
          minHeight: { md: 620 },
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(34, 34, 34, 0.10)",
        }}
      >
        <BrandPanel badge={badge} />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, sm: 5.5 },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 360 }}>{children}</Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default AuthLayout;

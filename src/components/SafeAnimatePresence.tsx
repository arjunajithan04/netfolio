import { AnimatePresence as FramerAnimatePresence } from "framer-motion";
import type { ComponentProps, ReactElement } from "react";

type Props = ComponentProps<typeof FramerAnimatePresence>;

// Framer Motion 11.18.2 types AnimatePresence as JSX.Element | undefined,
// which TypeScript rejects as a JSX component with this React type setup.
// The component renders nothing when absent, so normalize the public return type to null.
const SafeAnimatePresence = FramerAnimatePresence as unknown as (props: Props) => ReactElement | null;

export default SafeAnimatePresence;

import { redirect } from 'next/navigation';

/** Stage 0: the only route is the style tile. */
export default function Home() {
  redirect('/style-tile');
}

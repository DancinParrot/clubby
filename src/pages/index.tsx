import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

import { api } from "~/utils/api";
import styles from "./index.module.css";
import Header from "~/components/landing/header";
import Hero from "~/components/landing/hero";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Clubby</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>
        <Hero />
        {/* <div className={styles.showcaseContainer}> */}
        {/*   <p className={styles.showcaseText}> */}
        {/*     {hello.data ? hello.data.greeting : "Loading tRPC query..."} */}
        {/*   </p> */}
        {/*   <AuthShowcase /> */}
        {/* </div> */}
      </main>
    </>
  );
}

// function AuthShowcase() {
//   const { data: sessionData } = useSession();
//
//   const { data: secretMessage } = api.post.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined }
//   );
//
//   return (
//     <div className={styles.authContainer}>
//       <p className={styles.showcaseText}>
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className={styles.loginButton}
//         onClick={sessionData ? () => void signOut() : () => void signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// }

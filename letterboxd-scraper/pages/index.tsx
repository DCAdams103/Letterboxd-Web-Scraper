import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import { Grommet } from 'grommet';
import MovieContainer from '../components/movie-container';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  return (
    <>
      <Head>
        <title>Random Letterboxd Movie</title>
        <link rel="icon" href="/favicon.ico" />
      
      </Head>
      <main className={styles.main}>
        
        <MovieContainer />

        <div>
          
        </div>
      
      </main>
    </>
  )
}

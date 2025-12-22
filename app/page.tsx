import ColorBends from './ui/ColorBends';

export default function Home() {
  return (
    <div>
      <ColorBends

        colors={["#ff5c7a", "#8a5cff", "#00ff9dff"]}

        rotation={0}

        speed={0.2}

        scale={1.0}

        frequency={1.0}

        warpStrength={1.0}

        mouseInfluence={1.3}

        parallax={0.6}

        noise={0.08}

        transparent

      />
      <div className='mid'>
        <p className='text-4xl font-black border-b border-[#04020a]'>Nothing matter...</p>
      </div>

    </div>
  );
}

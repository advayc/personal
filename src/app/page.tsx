import PongTerminal from '@/components/PongTerminal';

export default function Home() {
  // ... other code

  const handleOpenTerminal = (config: any) => {
    if (config.id === 'pong') {
      const existingPong = document.querySelector('[data-pong-instance]');
      if (existingPong) return;
    }
    setOpenTerminals(prev => [...prev, config.id]);
    setIsTerminalOpen(true);
  };

  // ... rest of the component
} 
document.getElementById('flash-btn').addEventListener('click', selectPortAndFlash);

async function selectPortAndFlash() {
  const statusDiv = document.getElementById('status');
  const progressBar = document.getElementById('progress-bar').querySelector('div');
  const progressPercent = document.getElementById('progress-percent');

  statusDiv.textContent = 'Sélection du port...';

  try {
    // Demande de sélection du port
    const port = await navigator.serial.requestPort();

    // Configuration du port
    await port.open({ baudRate: 115200 });
    statusDiv.textContent = 'Port ouvert. Téléchargement du firmware...';

    // Téléchargement du firmware
    const response = await fetch('https://raw.githubusercontent.com/Titan-CyberTech/TitanOs-Firmware-TS3/main/Titan_Firmware_TS3.bin');
    if (!response.ok) throw new Error('Erreur lors du téléchargement du firmware');

    const firmwareData = await response.arrayBuffer();
    const totalSize = firmwareData.byteLength;
    let sentSize = 0;

    statusDiv.textContent = 'Firmware téléchargé. Envoi sur le port...';

    // Envoi des données sur le port
    const writer = port.writable.getWriter();
    const chunkSize = 1024; // Taille des morceaux envoyés

    for (let i = 0; i < totalSize; i += chunkSize) {
      const chunk = firmwareData.slice(i, i + chunkSize);
      await writer.write(new Uint8Array(chunk));
      sentSize += chunk.byteLength;

      // Mise à jour fluide de la barre de progression
      const percentComplete = Math.round((sentSize / totalSize) * 100);
      progressBar.style.width = percentComplete + '%';
      progressPercent.textContent = percentComplete + '%';
    }

    writer.releaseLock();
    statusDiv.textContent = 'Firmware envoyé avec succès.';

    // Fermeture du port
    await port.close();

  } catch (error) {
    console.error('Erreur :', error);
    statusDiv.textContent = 'Erreur : ' + error;
  }
}

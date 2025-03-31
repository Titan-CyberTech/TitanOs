document.getElementById('flash-btn').addEventListener('click', selectPortAndFlash);

async function selectPortAndFlash() {
  const statusDiv = document.getElementById('status');
  const progressBarDiv = document.getElementById('progress-bar').querySelector('div');
  const progressPercent = document.getElementById('progress-percent');

  // Vérifier si le navigateur supporte l'API Serial
  if (!('serial' in navigator)) {
    statusDiv.textContent = 'Web Serial API non supporté dans ce navigateur.';
    return;
  }

  try {
    statusDiv.textContent = 'Demande de sélection du port...';
    const port = await navigator.serial.requestPort();

    statusDiv.textContent = 'Ouverture du port...';
    await port.open({ baudRate: 115200 });

    statusDiv.textContent = 'Téléchargement du firmware...';
    const firmwareResponse = await fetch('https://raw.githubusercontent.com/Titan-CyberTech/TitanOs-Firmware-TS3/main/Titan_Firmware_TS3.bin');
    if (!firmwareResponse.ok) {
      throw new Error('Erreur lors du téléchargement du firmware');
    }
    const firmwareData = await firmwareResponse.arrayBuffer();
    const totalSize = firmwareData.byteLength;
    let sentSize = 0;

    statusDiv.textContent = 'Firmware téléchargé. Préparation au flash...';

    if (!port.writable) {
      throw new Error('Le port n\'est pas accessible en écriture.');
    }
    const writer = port.writable.getWriter();
    const chunkSize = 1024; // Taille des morceaux en octets

    // Envoi du firmware par morceaux
    for (let i = 0; i < totalSize; i += chunkSize) {
      const chunk = firmwareData.slice(i, i + chunkSize);
      await writer.write(new Uint8Array(chunk));
      sentSize += chunk.byteLength;

      // Mise à jour de la barre de progression
      const percentComplete = Math.round((sentSize / totalSize) * 100);
      progressBarDiv.style.width = percentComplete + '%';
      progressPercent.textContent = percentComplete + '%';
    }
    
    writer.releaseLock();
    statusDiv.textContent = 'Firmware flashé avec succès ! Fermeture du port...';
    await port.close();
    statusDiv.textContent = 'Opération terminée.';
  } catch (error) {
    console.error('Erreur :', error);
    statusDiv.textContent = 'Erreur : ' + error.message;
  }
}

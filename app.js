document.addEventListener('DOMContentLoaded', async () => {
  const cardsGrid = document.getElementById('cards-grid');
  const cardCount = document.getElementById('card-count');

  try {
    // 1. Cargamos la lista de tarjetas registradas
    const registryResponse = await fetch('cards/registry.json');
    if (!registryResponse.ok) throw new Error('No se pudo cargar registry.json');
    const registeredFiles = await registryResponse.json();

    // 2. Cargamos en paralelo cada tarjeta JSON
    const cardPromises = registeredFiles.map(async (filename) => {
      try {
        const res = await fetch(`cards/${filename}`);
        if (!res.ok) return null;
        return await res.json();
      } catch (err) {
        console.warn(`Error al cargar la tarjeta ${filename}:`, err);
        return null;
      }
    });

    const cards = (await Promise.all(cardPromises)).filter(Boolean);

    // 3. Actualizamos contador
    if (cardCount) {
      cardCount.textContent = cards.length;
    }

    // 4. Renderizamos las tarjetas
    cardsGrid.innerHTML = '';
    cards.forEach((card) => {
      const cardElement = document.createElement('article');
      cardElement.className = 'profile-card';

      const avatarUrl = card.github_user
        ? `https://github.com/${card.github_user}.png?size=120`
        : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(card.nombre)}`;

      const tagsHtml = Array.isArray(card.tecnologias)
        ? card.tecnologias.map((tag) => `<span class="tag">${tag}</span>`).join('')
        : '';

      const githubLink = card.github_user
        ? `<a href="https://github.com/${card.github_user}" target="_blank" rel="noopener noreferrer">@${card.github_user}</a>`
        : `<span class="tag">Sin GitHub</span>`;

      cardElement.innerHTML = `
        <div class="card-top">
          <div class="card-header">
            <img class="card-avatar" src="${avatarUrl}" alt="${card.nombre}" loading="lazy" />
            <div class="card-title-group">
              <h2>${card.nombre}</h2>
              <span class="card-role">${card.rol || 'Participante'}</span>
            </div>
          </div>
          <div class="card-body">
            <p>${card.mensaje || '¡Hola mundo desde Git!'}</p>
            <div class="card-tags">
              ${tagsHtml}
            </div>
          </div>
        </div>
        <div class="card-footer">
          ${githubLink}
        </div>
      `;

      cardsGrid.appendChild(cardElement);
    });
  } catch (error) {
    console.error('Error cargando los perfiles:', error);
    cardsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">
        <p>No se encontraron tarjetas o hubo un error al leer <code>cards/registry.json</code>.</p>
      </div>
    `;
  }
});
(async () => {
  const { data, error } = await supabase.storage
    .from('mosaic')
    .list('', { limit: 100 });

  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  const urls = await Promise.all(
    data.map(item => {
      const { publicURL } = supabase.storage
        .from('mosaic')
        .getPublicUrl(item.name);
      return publicURL;
    })
  );

  // Fisher–Yates shuffle
  for (let i = urls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [urls[i], urls[j]] = [urls[j], urls[i]];
  }

  const container = document.getElementById('mosaic');
  urls.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    container.appendChild(img);
  });
})();
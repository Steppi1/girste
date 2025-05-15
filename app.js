(async () => {
  // Initialize Supabase client (supabase.js must expose `supabase`)
  const { data, error } = await supabase.storage
    .from('mosaic')
    .list('', { limit: 100 });

  if (error) {
    console.error('Error fetching images:', error);
    return;
  }

  // Extract public URLs
  const urls = await Promise.all(
    data.map(async item => {
      const { publicURL, error: urlErr } = supabase.storage
        .from('mosaic')
        .getPublicUrl(item.name);
      if (urlErr) console.warn('URL error:', urlErr);
      return publicURL;
    })
  );

  // Shuffle URLs
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
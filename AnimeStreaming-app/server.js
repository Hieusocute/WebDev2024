// Tải các biến môi trường từ file .env
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const app = express();

// Import auth routes từ auth.js
const authRoutes = require('./routes/auth');

// Cấu hình port cho server
const PORT = process.env.PORT || 3000;

// Middleware để xử lý JSON
app.use(express.json());

// Sử dụng auth routes
app.use('/api/auth', authRoutes);

// Lấy client id từ MyAnimeList từ biến môi trường
const client_id = process.env.MAL_CLIENT_ID;

// Hàm tổng quát để lấy dữ liệu từ MyAnimeList API
async function get_anime_ranking(ranking_type) {
  try {
    const response = await axios.get(
      `https://api.myanimelist.net/v2/anime/ranking?ranking_type=${ranking_type}&limit=10&fields=mean,main_picture,num_episodes,start_date,num_list_users`,
      { headers: { 'X-MAL-CLIENT-ID': client_id } }
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ${ranking_type} ranking`, error);
    return [];
  }
}

// API endpoint cho trang Home
app.get('/home', async (req, res) => {
  try {
    // Gọi các API từ MyAnimeList để lấy top anime
    const [
      airing_anime,
      upcoming_anime,
      tv_series_anime,
      movie_anime,
      ova_anime,
      specials_anime,
      popular_anime,
      favourited_anime,
    ] = await Promise.all([
      get_anime_ranking('airing'),
      get_anime_ranking('upcoming'),
      get_anime_ranking('tv'),
      get_anime_ranking('movie'),
      get_anime_ranking('ova'),
      get_anime_ranking('special'),
      get_anime_ranking('bypopularity'),
      get_anime_ranking('favorite'),
    ]);

    // Kiểm tra xem có dữ liệu không trước khi trả về kết quả
    const result = {
      airing_anime: airing_anime.length > 0 ? airing_anime : "No data available",
      upcoming_anime: upcoming_anime.length > 0 ? upcoming_anime : "No data available",
      tv_series_anime: tv_series_anime.length > 0 ? tv_series_anime : "No data available",
      movie_anime: movie_anime.length > 0 ? movie_anime : "No data available",
      ova_anime: ova_anime.length > 0 ? ova_anime : "No data available",
      specials_anime: specials_anime.length > 0 ? specials_anime : "No data available",
      popular_anime: popular_anime.length > 0 ? popular_anime : "No data available",
      favourited_anime: favourited_anime.length > 0 ? favourited_anime : "No data available",
    };

    // Trả về dữ liệu dưới dạng JSON
    res.json(result);
  } catch (error) {
    console.error("Error fetching data from MyAnimeList", error);
    res.status(500).json({ message: 'Error fetching anime data.' });
  }
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
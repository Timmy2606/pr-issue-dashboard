module.exports = async function(req, res) {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: '검색어가 필요합니다.' });
    }

    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    try {
        const response = await fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=10&sort=date`, {
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret
            }
        });

        const data = await response.json();
        
        // 네이버 API 자체 인증 에러 발생 시 처리
        if (data.errorCode || data.errorMessage) {
            return res.status(response.status || 500).json({ error: data.errorMessage || '네이버 API 인증 오류' });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: '서버 내부 오류: ' + error.message });
    }
};

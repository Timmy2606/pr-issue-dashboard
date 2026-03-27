module.exports = async function(req, res) {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: '검색어가 필요합니다.' });

    const naverClientId = process.env.NAVER_CLIENT_ID;
    const naverClientSecret = process.env.NAVER_CLIENT_SECRET;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) return res.status(500).json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' });

    try {
        // 1. 네이버 뉴스 실시간 10건 수집
        const naverRes = await fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=10&sort=date`, {
            headers: { 'X-Naver-Client-Id': naverClientId, 'X-Naver-Client-Secret': naverClientSecret }
        });
        const naverData = await naverRes.json();
        if (naverData.errorCode) throw new Error(naverData.errorMessage);

        // 기사 제목 및 본문 요약본 추출
        const newsContext = naverData.items.map(item => `- 제목: ${item.title.replace(/<[^>]+>/g, '')}\n  내용: ${item.description.replace(/<[^>]+>/g, '')}`).join('\n\n');

        // 2. Gemini API 프롬프트 구성 (JSON 포맷 강제)
        const prompt = `당신은 포스코이앤씨 소속 20년 차 대기업 PR 전문가입니다. 다음은 '${query}'에 대한 방금 보도된 실시간 뉴스 기사들입니다.\n\n${newsContext}\n\n이 실제 기사 데이터만을 바탕으로 다음 구조의 JSON 형태로만 응답하십시오. \n\n{ "snippetTitle": "이슈 핵심 정의 (10자 내외)", "snippetDesc": "현재 상황 핵심 요약 (3문장)", "a_bullets": ["핵심 요약 1", "핵심 요약 2", "주요 확산 추이"], "b_bullets": ["전체 매체 논조 (긍정/부정/중립 요약)", "주요 오피니언 동향", "포털 여론 예측"], "c_bullets": ["건설업계/포스코 그룹 파급도 예측", "유사 위기 대응 자산 활용 방안", "홍보팀 1차 대응 가이드라인 및 스피킹 포인트"] }`;

        // 3. Gemini 1.5 Flash API 호출
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2, response_mime_type: "application/json" }
            })
        });

        const geminiData = await geminiRes.json();
        if(geminiData.error) throw new Error(geminiData.error.message);

        // AI가 생성한 JSON 텍스트 파싱
        const aiText = geminiData.candidates[0].content.parts[0].text;
        const finalResult = JSON.parse(aiText);

        res.status(200).json(finalResult);
    } catch (error) {
        res.status(500).json({ error: '서버 분석 오류: ' + error.message });
    }
};

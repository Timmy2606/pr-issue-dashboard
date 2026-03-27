{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 export default async function handler(req, res) \{\
    // 1. \uc0\u54532 \u47200 \u53944 \u50644 \u46300 \u50640 \u49436  \u51204 \u45804 \u48155 \u51008  \u44160 \u49353 \u50612  (\u50696 : \u45432 \u46976 \u48393 \u53804 \u48277 )\
    const \{ query \} = req.query;\
\
    if (!query) \{\
        return res.status(400).json(\{ error: '\uc0\u44160 \u49353 \u50612 \u44032  \u54596 \u50836 \u54633 \u45768 \u45796 .' \});\
    \}\
\
    // 2. \uc0\u54872 \u44221  \u48320 \u49688 \u50640 \u49436  \u45348 \u51060 \u48260  API \u53412  \u54840 \u52636  (\u48372 \u50504  \u50976 \u51648 )\
    const clientId = process.env.NAVER_CLIENT_ID;\
    const clientSecret = process.env.NAVER_CLIENT_SECRET;\
\
    try \{\
        // 3. \uc0\u45348 \u51060 \u48260  \u45684 \u49828  \u44160 \u49353  API \u54840 \u52636  (\u52572 \u49888 \u49692  \u51221 \u47148 , 10\u44148 )\
        const response = await fetch(`https://openapi.naver.com/v1/search/news.json?query=$\{encodeURIComponent(query)\}&display=10&sort=date`, \{\
            headers: \{\
                'X-Naver-Client-Id': clientId,\
                'X-Naver-Client-Secret': clientSecret\
            \}\
        \});\
\
        const data = await response.json();\
        \
        // 4. \uc0\u44208 \u44284 \u47484  \u54532 \u47200 \u53944 \u50644 \u46300 \u47196  \u51204 \u49569 \
        res.status(200).json(data);\
    \} catch (error) \{\
        res.status(500).json(\{ error: '\uc0\u45936 \u51060 \u53552 \u47484  \u48520 \u47084 \u50724 \u45716  \u51473  \u50724 \u47448 \u44032  \u48156 \u49373 \u54664 \u49845 \u45768 \u45796 .' \});\
    \}\
\}}
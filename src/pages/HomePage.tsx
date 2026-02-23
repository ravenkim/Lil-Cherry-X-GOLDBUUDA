import { useState } from 'react'
import { Battery, Wifi, Upload, Heart, ListPlus, Shuffle } from 'lucide-react'

const HomePage = () => {
    const [selectedVideo, setSelectedVideo] = useState('BLINDING LIGHTS')
    
    const videos = [
        'BLINDING LIGHTS',
        'DO I WANNA KNOW?',
        'INSTANT CRUSH',
        'LEVITATING',
        'STARBOY',
        'NIGHTCALL',
        'MIDNIGHT CITY'    
    ]

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
            {/* 모바일 프레임: 375:667 비율 고정, 뷰포트에 맞게 fit → 남는 영역은 배경(검정) */}
            <div className="aspect-[375/667] w-[min(100vw,calc(100dvh*375/667))] max-h-[100dvh] bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 flex flex-col flex-1 min-h-0">
                    {/* 상단 상태바 */}
                    <div className="flex items-center justify-between mb-4 px-2 flex-shrink-0">
                        <Battery className="w-5 h-5 text-gray-700" />
                        <h1 className="text-lg font-bold text-gray-800 tracking-wider">VIDEOS</h1>
                        <Wifi className="w-5 h-5 text-gray-700" />
                    </div>

                    {/* 플레이리스트만 스크롤 (고정 높이 영역 안에서) */}
                    <div className="flex-[4] min-h-0 flex flex-col mb-4">
                        <div className="h-full min-h-0 rounded-2xl overflow-hidden bg-blue-50 shadow-inner">
                            <div className="h-full overflow-y-auto overflow-x-hidden p-3">
                                <div className="space-y-0">
                                    {videos.map((video, index) => (
                                        <div
                                            key={video}
                                            onClick={() => setSelectedVideo(video)}
                                            className={`px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm ${
                                                selectedVideo === video
                                                    ? 'bg-blue-400 text-white font-bold shadow-lg'
                                                    : 'text-gray-700 hover:bg-blue-100'
                                            } ${index !== videos.length - 1 ? 'mb-1' : ''}`}
                                        >
                                            {video}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* iPod 휠 영역: 비디오 영역과 가로 줄 맞춤, 내부는 space-between */}
                    <div className="flex-[5] flex-shrink-0 flex flex-col justify-between w-full min-h-0">
                        {/* 휠 주변 4버튼 (iPod 스타일) */}
                        <div className="flex items-center justify-between w-full flex-shrink-0">
                            {[
                                { icon: Upload, label: 'Share' },
                                { icon: Heart, label: 'Like' },
                                { icon: ListPlus, label: 'Add to Playlist' },
                                { icon: Shuffle, label: 'Shuffle' },
                            ].map(({ icon: Icon, label }) => (
                                <button
                                    key={label}
                                    className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 shadow-sm hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
                                    aria-label={label}
                                >
                                    <Icon className="w-5 h-5 text-gray-600" />
                                </button>
                            ))}
                        </div>
                        {/* iPod 클릭 휠 - 가로·세로 동일(size)이라 완벽한 원 */}
                        <div className="flex items-center justify-center flex-shrink-0">
                            <div className="w-56 h-56 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-[inset_0_2px_8px_rgba(255,255,255,0.8),inset_0_-2px_6px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center border border-gray-200/80">
                                <button
                                    className="w-[38%] aspect-square min-w-9 min-h-9 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.06)] border border-gray-200/60 hover:bg-gray-50 active:scale-[0.98] transition-all"
                                    aria-label="Select"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 홈 인디케이터 */}
                    <div className="flex justify-center pt-4 flex-shrink-0">
                        <div className="w-28 h-1 bg-gray-300 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage

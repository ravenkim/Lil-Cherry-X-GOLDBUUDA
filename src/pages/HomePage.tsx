import { useState, useRef, useCallback, useEffect } from 'react'
import { Battery, Wifi, ChevronsLeft, Heart, ListPlus, ChevronsRight } from 'lucide-react'
import { videos } from '../data/videos'

const ANGLE_THRESHOLD = 0.25 // rad - 이만큼 돌릴 때마다 한 항목 이동
const ITEMS_PER_PAGE = 5

const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE)

const MARQUEE_DURATION = 12
const MARQUEE_RIGHT_PADDING = 12

const HomePage = () => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [marqueeDistance, setMarqueeDistance] = useState(0)
    const wheelRef = useRef<HTMLDivElement>(null)
    const lastAngleRef = useRef<number | null>(null)
    const accumulatedRef = useRef(0)
    const isDraggingRef = useRef(false)
    const marqueeContainerRef = useRef<HTMLDivElement>(null)
    const marqueeInnerRef = useRef<HTMLSpanElement>(null)

    const currentPage = Math.floor(selectedIndex / ITEMS_PER_PAGE)
    const pageVideos = videos.slice(
        currentPage * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    )
    const highlightIndexInPage = selectedIndex - currentPage * ITEMS_PER_PAGE

    const moveSelection = useCallback((direction: 1 | -1) => {
        setSelectedIndex((i) =>
            Math.max(0, Math.min(videos.length - 1, i + direction))
        )
    }, [])

    const getAngle = useCallback((clientX: number, clientY: number) => {
        const el = wheelRef.current
        if (!el) return 0
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        return Math.atan2(clientY - cy, clientX - cx)
    }, [])

    const handleWheelPointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault()
        if (!wheelRef.current) return
        isDraggingRef.current = true
        lastAngleRef.current = getAngle(e.clientX, e.clientY)
        accumulatedRef.current = 0
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }, [getAngle])

    const handleWheelPointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDraggingRef.current || lastAngleRef.current === null) return
        const angle = getAngle(e.clientX, e.clientY)
        let delta = angle - lastAngleRef.current
        if (delta > Math.PI) delta -= 2 * Math.PI
        if (delta < -Math.PI) delta += 2 * Math.PI
        lastAngleRef.current = angle
        accumulatedRef.current += delta
        if (Math.abs(accumulatedRef.current) >= ANGLE_THRESHOLD) {
            const step = accumulatedRef.current > 0 ? 1 : -1
            moveSelection(step as 1 | -1)
            accumulatedRef.current = 0
        }
    }, [getAngle, moveSelection])

    const handleWheelPointerUp = useCallback((e: React.PointerEvent) => {
        isDraggingRef.current = false
        lastAngleRef.current = null
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    }, [])

    const scrollAccumRef = useRef(0)
    const listAreaRef = useRef<HTMLDivElement>(null)
    const handleListWheel = useCallback(
        (e: WheelEvent) => {
            e.preventDefault()
            scrollAccumRef.current += e.deltaY
            const threshold = 2048
            if (Math.abs(scrollAccumRef.current) >= threshold) {
                const direction = scrollAccumRef.current > 0 ? 1 : -1
                moveSelection(direction as 1 | -1)
                scrollAccumRef.current = 0
            }
        },
        [moveSelection]
    )
    useEffect(() => {
        const el = listAreaRef.current
        if (!el) return
        el.addEventListener('wheel', handleListWheel, { passive: false })
        return () => el.removeEventListener('wheel', handleListWheel)
    }, [handleListWheel])

    useEffect(() => {
        if (marqueeContainerRef.current && marqueeInnerRef.current) {
            const containerWidth = marqueeContainerRef.current.offsetWidth - MARQUEE_RIGHT_PADDING
            const textWidth = marqueeInnerRef.current.scrollWidth
            const overflow = textWidth - containerWidth
            setMarqueeDistance(overflow > 0 ? overflow : 0)
        } else {
            setMarqueeDistance(0)
        }
    }, [selectedIndex, currentPage, pageVideos])

    return (
        <>
            <style>{`
                @keyframes title-marquee {
                    0%, 8% { transform: translateX(0); }
                    42% { transform: translateX(var(--marquee-delta, 0)); }
                    58% { transform: translateX(var(--marquee-delta, 0)); }
                    92%, 100% { transform: translateX(0); }
                }
            `}</style>
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

                    {/* 플레이리스트: 5개씩 페이지, 휠은 한 항목씩 이동·끝에서 스크롤 시 다음 페이지 */}
                    <div ref={listAreaRef} className="flex-[4] min-h-0 flex flex-col mb-4">
                        <div className="h-full min-h-0 rounded-2xl overflow-hidden bg-blue-50 shadow-inner">
                            <div className="h-full overflow-hidden p-3 flex flex-col">
                                <div className="space-y-0 flex-1 min-h-0">
                                    {pageVideos.map((video, index) => (
                                        <div
                                            key={`${currentPage}-${video.title}`}
                                            className={`px-3 py-2.5 rounded-xl transition-all text-sm select-none min-w-0 ${
                                                index === highlightIndexInPage
                                                    ? 'bg-blue-400 text-white font-bold shadow-lg'
                                                    : 'text-gray-700'
                                            } ${index !== pageVideos.length - 1 ? 'mb-1' : ''}`}
                                        >
                                            {index === highlightIndexInPage ? (
                                                <div
                                                    ref={marqueeContainerRef}
                                                    className="overflow-hidden w-full pr-3"
                                                >
                                                    <span
                                                        ref={marqueeInnerRef}
                                                        className="inline-block whitespace-nowrap"
                                                        style={
                                                            marqueeDistance > 0
                                                                ? {
                                                                      animation: `title-marquee ${MARQUEE_DURATION}s ease-in-out infinite`,
                                                                      ['--marquee-delta' as string]: `-${marqueeDistance}px`,
                                                                  }
                                                                : undefined
                                                        }
                                                    >
                                                        {video.title}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="block truncate">{video.title}</span>
                                            )}
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
                                { icon: ChevronsLeft, label: '이전' },
                                { icon: Heart, label: 'Like' },
                                { icon: ListPlus, label: 'Add to Playlist' },
                                { icon: ChevronsRight, label: '다음' },
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
                        {/* iPod 클릭 휠 - 오른쪽(시계) 돌리면 아래, 반시계 돌리면 위로 이동 */}
                        <div className="flex items-center justify-center flex-shrink-0">
                            <div
                                ref={wheelRef}
                                role="slider"
                                aria-label="비디오 선택 휠"
                                aria-valuenow={selectedIndex}
                                aria-valuemin={0}
                                aria-valuemax={videos.length - 1}
                                tabIndex={0}
                                onPointerDown={handleWheelPointerDown}
                                onPointerMove={handleWheelPointerMove}
                                onPointerUp={handleWheelPointerUp}
                                onPointerCancel={handleWheelPointerUp}
                                className="w-56 h-56 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-[inset_0_2px_8px_rgba(255,255,255,0.8),inset_0_-2px_6px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center border border-gray-200/80 touch-none select-none cursor-grab active:cursor-grabbing"
                            >
                                <span
                                    className="w-[38%] aspect-square min-w-9 min-h-9 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.06)] border border-gray-200/60 pointer-events-none"
                                    aria-hidden
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
        </>
    )
}

export default HomePage

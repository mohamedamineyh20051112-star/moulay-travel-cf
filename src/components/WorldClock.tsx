'use client';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type ClockConfig = {
  id: string;
  timezone: string;
  labelFallback: string;
};

const MAIN_CLOCK: ClockConfig = {
  id: 'algiers',
  timezone: 'Africa/Algiers',
  labelFallback: 'ALGIERS',
};

const SMALL_CLOCKS: ClockConfig[] = [
  { id: 'newYork', timezone: 'America/New_York', labelFallback: 'NEW YORK' },
  { id: 'london', timezone: 'Europe/London', labelFallback: 'LONDON' },
  { id: 'istanbul', timezone: 'Europe/Istanbul', labelFallback: 'ISTANBUL' },
  { id: 'dubai', timezone: 'Asia/Dubai', labelFallback: 'DUBAI' },
];

const DIAL_NUMBERS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function NumberedAnalogClock({
  h,
  m,
  s,
  isMain,
}: {
  h: number;
  m: number;
  s: number;
  isMain: boolean;
}) {
  const secondDeg = s * 6;
  const minuteDeg = m * 6 + s * 0.1;
  const hourDeg = (h % 12) * 30 + m * 0.5;
  const radius = isMain ? 38 : 36;

  return (
    <div
      className={`relative rounded-full bg-white shadow-md flex items-center justify-center select-none ${
        isMain
          ? 'w-44 h-44 sm:w-52 sm:h-52 border-[6px] border-[#1f2937]'
          : 'w-24 h-24 sm:w-28 sm:h-28 border-[4px] border-[#1f2937]'
      }`}
    >
      {/* Subtle minute ticks */}
      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 flex justify-center"
          style={{ transform: `rotate(${i * 6}deg)` }}
        >
          <div
            className={`${
              i % 5 === 0
                ? isMain
                  ? 'w-[2px] h-2 bg-gray-800 mt-1'
                  : 'w-[1.5px] h-1.5 bg-gray-700 mt-0.5'
                : isMain
                  ? 'w-[1px] h-1 bg-gray-400 mt-1'
                  : 'hidden'
            }`}
          />
        </div>
      ))}

      {/* Dial Numbers 1-12 */}
      {DIAL_NUMBERS.map((num, idx) => {
        const angleRad = ((idx * 30 - 90) * Math.PI) / 180;
        const x = 50 + radius * Math.cos(angleRad);
        const y = 50 + radius * Math.sin(angleRad);
        return (
          <span
            key={num}
            style={{ left: `${x}%`, top: `${y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 font-bold text-[#1f2937] leading-none ${
              isMain ? 'text-sm sm:text-base' : 'text-[9px] sm:text-[10px]'
            }`}
          >
            {num}
          </span>
        );
      })}

      {/* Hour Hand */}
      <div
        className="absolute inset-0 flex justify-center items-end pb-[50%]"
        style={{ transform: `rotate(${hourDeg}deg)` }}
      >
        <div
          className={`bg-[#1f2937] rounded-full origin-bottom ${
            isMain ? 'w-1.5 h-11 sm:h-12' : 'w-1 h-6 sm:h-7'
          }`}
        />
      </div>

      {/* Minute Hand */}
      <div
        className="absolute inset-0 flex justify-center items-end pb-[50%]"
        style={{ transform: `rotate(${minuteDeg}deg)` }}
      >
        <div
          className={`bg-[#1f2937] rounded-full origin-bottom ${
            isMain ? 'w-1 h-16 sm:h-18' : 'w-[2.5px] h-8 sm:h-9'
          }`}
        />
      </div>

      {/* Second Hand */}
      <div
        className="absolute inset-0 flex justify-center items-end pb-[50%]"
        style={{ transform: `rotate(${secondDeg}deg)` }}
      >
        <div
          className={`bg-[#c59a3f] rounded-full origin-bottom ${
            isMain ? 'w-[1.5px] h-16 sm:h-20' : 'w-[1px] h-9 sm:h-10'
          }`}
        />
      </div>

      {/* Center Pin */}
      <div
        className={`absolute rounded-full bg-[#1f2937] ring-2 ring-[#c59a3f] z-10 ${
          isMain ? 'w-3 h-3' : 'w-2 h-2'
        }`}
      />
    </div>
  );
}

function getTimeParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const m = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
  const s = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);
  const digital = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  return { h: h === 24 ? 0 : h, m, s, digital };
}

export default function WorldClock() {
  const t = useTranslations('WorldClock');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <div className="py-16 min-h-[380px] bg-[#f8f6f1]" />;
  }

  const mainParts = getTimeParts(time, MAIN_CLOCK.timezone);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55 }}
      className="py-16 sm:py-20 bg-[#f8f6f1] border-y border-[#e5d5b5]/60"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[2rem] border border-[#e5d5b5] shadow-lg p-8 sm:p-12 flex flex-col items-center"
        >
          {/* Main Algiers Clock */}
          <NumberedAnalogClock h={mainParts.h} m={mainParts.m} s={mainParts.s} isMain />
          <p className="mt-4 text-sm font-bold tracking-widest uppercase text-[#c59a3f]">
            {t(MAIN_CLOCK.id)} • <span className="font-mono text-[#1f2937]" dir="ltr">{mainParts.digital}</span>
          </p>

          {/* Bold Center Title */}
          <h2 className="mt-4 mb-8 text-2xl sm:text-4xl font-black tracking-wider uppercase text-[#1f2937] text-center">
            {t('title')}
          </h2>

          {/* 4 Compact Clocks Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 w-full justify-items-center">
            {SMALL_CLOCKS.map((clock, idx) => {
              const p = getTimeParts(time, clock.timezone);
              return (
                <motion.div
                  key={clock.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex flex-col items-center gap-2.5"
                >
                  <NumberedAnalogClock h={p.h} m={p.m} s={p.s} isMain={false} />
                  <div className="text-center">
                    <div className="font-extrabold text-xs sm:text-sm tracking-wide uppercase text-[#1f2937]">
                      {t(clock.id)}
                    </div>
                    <div className="text-xs font-mono text-gray-500" dir="ltr">
                      {p.digital}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

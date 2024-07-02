import React from 'react'

type ChipIconProps = {
    value: number,
    disabled?: boolean,
    small?: boolean,
    onClickElem: (value: number) => void,
};

const chipColors: any = {
    1: { text: "text-white", fill: "fill-white", bg: "bg-black" }, 2: { text: "text-yellow-500", fill: "fill-yellow-500", bg: "bg-black" }, 5: { text: "text-red-500", fill: "fill-red-500", bg: "bg-black" }, 10: { text: "text-blue-500", fill: "fill-blue-500", bg: "bg-black" }, 50: { text: "text-gray-500", fill: "fill-gray-500", bg: "bg-black" }, 100: { text: "text-orange-500", fill: "fill-orange-500", bg: "bg-black" }, 500: { text: "text-pink-500", fill: "fill-pink-500", bg: "bg-black" }, 1000: { text: "text-sky-500", fill: "fill-sky-500", bg: "bg-black" }
};

function Chip({ className }: { className: string }) {
    return (
        <svg version="1.1" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" className={className}>
            <g fill-rule="evenodd">
                <path d="m602.14 18.406c-320.88-0.12891-583.74 259.52-584.14 576.93-0.39453 324.38 258.45 586.44 579.83 587.07 321.19 0.61328 584-260.25 584.17-579.85 0.16797-321.92-260.02-584.03-579.86-584.15zm-2.582 1096.4c-108.53 0-212.53-33.695-300.78-97.43-229.87-166.09-281.77-488.25-115.71-718.15 96.445-133.48 252.46-213.17 417.35-213.17 108.53 0 212.54 33.707 300.79 97.465 229.87 166.09 281.79 488.24 115.71 718.13-96.43 133.48-252.45 213.16-417.36 213.16z" />
                <path d="m887.57 202.36c-84.254-60.875-183.55-93.047-287.16-93.047-157.44 0-306.39 76.078-398.48 203.51-158.53 219.49-108.98 527.09 110.48 685.67 84.254 60.852 183.55 93.023 287.15 93.023 157.45 0 306.42-76.094 398.5-203.53 158.57-219.47 109-527.04-110.48-685.62zm-98.746 6.5039c90.238 45.156 156.48 111.19 202.21 201.48-19.812 9.8164-39.023 19.344-58.129 28.824-17.531-36.277-41.242-70.309-71.293-100.37-30.098-30.086-64.465-54.312-101.73-72.191 9.3711-18.711 18.961-37.836 28.945-57.746zm-142.11-41.641c-2.1836 22.477-4.2617 44.062-6.3359 65.473-13.32-1.4414-26.773-2.2305-40.367-2.2305-71.09 0-139.07 20.004-197.66 57.203-10.727-17.531-21.816-35.688-33.637-55.031 85.488-53.172 176.26-73.535 278-65.414zm-387.5 169.21c17.484 13.715 34.309 30.012 50.953 43.164-53.148 66.934-79.836 148.4-79.922 232.4h-65.074c1.8359-96 32.207-195.76 94.043-275.57zm110.55 632.13c-84.938-54.238-143.46-126.9-179-222.05 20.855-7.7539 40.848-15.395 60.492-22.859 17.773 50.555 46.812 98.004 87.156 138.36 20.23 20.23 42.445 37.738 66.121 52.535-11.199 17.379-22.781 35.379-34.766 54.012zm137 52.68c4.2227-19.766 8.4844-39.695 12.758-59.723 26.137 5.7617 53.051 8.832 80.473 8.832 84.996 0 165.54-28.523 230.9-80.941 12.457 15.984 24.984 32.039 37.5 48.109-78.723 80.629-260.91 121.31-361.63 83.723zm313.69-200.4c-58.883 58.895-137.18 91.32-220.46 91.32s-161.57-32.426-220.45-91.297c-121.52-121.57-121.52-319.37 0-440.91 58.898-58.887 137.18-91.309 220.46-91.309s161.58 32.426 220.45 91.309c121.56 121.56 121.56 319.34 0 440.89zm148.46 9.6953c-19.008-11.629-37.273-22.789-55.379-33.875 45.145-72.098 63.07-156.43 53.785-238.3 20.426-1.8242 41.723-3.7422 64.488-5.7852 11.434 100.72-11.305 190.82-62.895 277.96z" />
            </g>
        </svg>

    )
}


export default function ChipIcon({ small, value, disabled, onClickElem }: ChipIconProps) {
    if (small) {
        return (
            <div className={'h-[40px] aspect-square rounded-full flex justify-center items-center font-bold mx-1 ' + chipColors[value]['bg'] + (disabled ? " cursor-not-allowed grayscale opacity-25" : " cursor-pointer")} onClick={() => onClickElem(value)}>
                <Chip className={'h-[38px] text-sm ' + chipColors[value]['fill']}></Chip>
                <p className={'absolute ' + chipColors[value]['text']}>{value}</p>
            </div>
        )
    }

    return (
        <div className={'h-2/5 sm:h-3/5 lg:h-3/4 2xl:h-5/6 aspect-square rounded-full flex justify-center items-center text-lg font-bold mx-1 ' + chipColors[value]['bg'] + (disabled ? " cursor-not-allowed grayscale opacity-25" : " cursor-pointer")} onClick={() => onClickElem(value)}>
            <Chip className={'h-[35px] sm:h-[55px] lg:h-[70px] 2xl:h-[85px] ' + chipColors[value]['fill']}></Chip>
            <p className={'absolute ' + chipColors[value]['text']}>{value}</p>
        </div>
    )
}

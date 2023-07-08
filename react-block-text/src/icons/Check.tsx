import { SVGAttributes } from 'react'

function CheckIcon(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5 16.577l2.194-2.195 5.486 5.484L24.804 7.743 27 9.937l-14.32 14.32z" />
    </svg>
  )
}

export default CheckIcon

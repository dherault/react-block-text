import { SVGAttributes } from 'react'

function TrashIcon(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        d="M16.88,22.5H7.12a1.9,1.9,0,0,1-1.9-1.8L4.36,5.32H19.64L18.78,20.7A1.9,1.9,0,0,1,16.88,22.5Z"
      />
      <line
        x1="2.45"
        y1="5.32"
        x2="21.55"
        y2="5.32"
        stroke="currentColor"
      />
      <path
        fill="none"
        stroke="currentColor"
        d="M10.09,1.5h3.82a1.91,1.91,0,0,1,1.91,1.91V5.32a0,0,0,0,1,0,0H8.18a0,0,0,0,1,0,0V3.41A1.91,1.91,0,0,1,10.09,1.5Z"
      />
      <line
        x1="12"
        y1="8.18"
        x2="12"
        y2="19.64"
        stroke="currentColor"
      />
      <line
        x1="15.82"
        y1="8.18"
        x2="15.82"
        y2="19.64"
        stroke="currentColor"
      />
      <line
        x1="8.18"
        y1="8.18"
        x2="8.18"
        y2="19.64"
        stroke="currentColor"
      />
    </svg>
  )
}

export default TrashIcon

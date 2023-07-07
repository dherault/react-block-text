import { SVGAttributes } from 'react'

function DragIcon(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.5 3C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2C9.77614 2 10 2.22386 10 2.5C10 2.77614 9.77614 3 9.5 3Z"
        stroke="currentColor"
      />
      <path
        d="M9.5 8C9.22386 8 9 7.77614 9 7.5C9 7.22386 9.22386 7 9.5 7C9.77614 7 10 7.22386 10 7.5C10 7.77614 9.77614 8 9.5 8Z"
        stroke="currentColor"
      />
      <path
        d="M9.5 13C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12C9.77614 12 10 12.2239 10 12.5C10 12.7761 9.77614 13 9.5 13Z"
        stroke="currentColor"
      />
      <path
        d="M5.5 3C5.22386 3 5 2.77614 5 2.5C5 2.22386 5.22386 2 5.5 2C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3Z"
        stroke="currentColor"
      />
      <path
        d="M5.5 8C5.22386 8 5 7.77614 5 7.5C5 7.22386 5.22386 7 5.5 7C5.77614 7 6 7.22386 6 7.5C6 7.77614 5.77614 8 5.5 8Z"
        stroke="currentColor"
      />
      <path
        d="M5.5 13C5.22386 13 5 12.7761 5 12.5C5 12.2239 5.22386 12 5.5 12C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13Z"
        stroke="currentColor"
      />
    </svg>
  )
}

export default DragIcon
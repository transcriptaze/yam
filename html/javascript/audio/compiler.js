export function compile(json) {
  const track = JSON.parse(json)

  // prettier-ignore
  const re = /([1-9][0-9]*):(4)/
  const match = track.timeSignature.match(re)
  const beats = parseInt(match[1])
  const divisions = parseInt(match[2])

  // prettier-ignore
  const pattern = []

  for (let beat =1; beat<=beats; beat++) {
    switch (beat) {
    case 1:
      pattern.push(`   @1  tick`)
      break

    default:
      pattern.push(`   @${beat}  tock`)
    }
  }

  // prettier-ignore
  return [
		`start:`,
    ...pattern,
		`   jmp start`,
	]
}

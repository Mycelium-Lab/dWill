export function createRightEditTime(base) {
    let year
    let month
    let day
    if (base.y === 0 && base.mo === 0 && base.d === 0 && base.h === 23) {
        year = 0
        month = 0
        day = 1
        base.y = year
        base.mo = month
        base.d = day
    } else if (base.y === 0 && base.mo === 11 && base.d === 30 && base.h === 23) {
        year = 1
        month = 0
        day = 0
        base.y = year
        base.mo = month
        base.d = day
    } else if (base.y === 1 && base.mo === 1 && base.d === 0 && base.h === 23) {
        year = 1
        month = 1
        day = 1
        base.y = year
        base.mo = month
        base.d = day
    } else {
        year = base.y
        month = base.mo
        day = base.d
    }
    return (
        {
            year,
            month,
            day,
            base_y: base.y,
            base_mo: base.mo,
            base_d: base.d,
            base_h: base.h
        }
    )
}

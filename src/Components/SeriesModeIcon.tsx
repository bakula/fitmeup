export type Mode = "initial"|"workout"
export function SeriesModeIcon({mode}:{mode:Mode}){
    return mode === "initial" ? <i className="pi pi-circle"></i> :<i className="pi pi-circle-fill"></i>
}

export default SeriesModeIcon
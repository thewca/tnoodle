export default interface WcaEvent {
    id: string;
    name: string;
    format_ids: string[];
    is_fewest_moves: boolean;
    is_multiple_blindfolded: boolean;
}

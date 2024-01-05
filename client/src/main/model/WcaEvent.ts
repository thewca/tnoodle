export default interface WcaEvent {
    id: string;
    name: string;
    puzzle_id: string;
    puzzle_group_id: string | null;
    format_ids: string[];
    is_fewest_moves: boolean;
    is_multiple_blindfolded: boolean;
}

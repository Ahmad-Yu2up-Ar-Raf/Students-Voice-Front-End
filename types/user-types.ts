export interface DataResponse {
    data:    Datum[];
    success: boolean;
    message: string;
}

export interface Datum {
    id:            number;
    created_at:    Date;
    updated_at:    Date;
    user_id:       number;
    media:         Media[] | null;
    caption:       string;
    tag_category:  string;
    tag_location:  null;
    tagline:       string;
    visibility:    string;
    likes_count:   number;
    reposts_count: number;
}

export interface Media {
    file:      File;
    file_path: string;
    preview:   string;
    id:        string;
    uri:       string;
}

export interface File {
    name: string;
    size: number;
    type: string;
}

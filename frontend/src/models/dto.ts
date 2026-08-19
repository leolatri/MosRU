export interface ViolationDTO {
    id: string;
    applicationNumber: string;
    publicationDate: number;
    district: string | null;
    region: string | null;
    object: string;
    objectCategory: string;
    problemTopic: string;
    responseDeadline: string | null;
    responseStatus: string;
}

export interface ViolationPayload {
    sourceMessageId: number;
    applicationNumber: number;
    publicationDate: string;
    districtId?: number | null;
    objectName: string;
    objectCategoryId: number;
    problemTopicId: number;
    responseDeadline?: string | null;
    responseStatusId: number;
}
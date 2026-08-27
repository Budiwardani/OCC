class ComplaintResponse {
  final int id;
  final int complaintId;
  final int? responderId;
  final String? responderName;
  final String message;
  final bool isInternal;
  final DateTime createdAt;

  ComplaintResponse({
    required this.id,
    required this.complaintId,
    this.responderId,
    this.responderName,
    required this.message,
    required this.isInternal,
    required this.createdAt,
  });

  factory ComplaintResponse.fromJson(Map<String, dynamic> json) {
    return ComplaintResponse(
      id: json['id'] ?? 0,
      complaintId: json['complaint_id'] ?? 0,
      responderId: json['responder_id'],
      responderName: json['responder'] ?? json['responder_name'],
      message: json['message'] ?? '',
      isInternal: json['is_internal'] ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'complaint_id': complaintId,
      'responder_id': responderId,
      'responder_name': responderName,
      'message': message,
      'is_internal': isInternal,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

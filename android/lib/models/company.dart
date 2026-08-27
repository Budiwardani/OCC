class Company {
  final int id;
  final String name;
  final String? address;
  final String? phone;
  final String? emailSupport;
  final String? mapsLocation;
  final Map<String, dynamic>? socialMedia;
  final String? logoUrl;
  final DateTime createdAt;

  Company({
    required this.id,
    required this.name,
    this.address,
    this.phone,
    this.emailSupport,
    this.mapsLocation,
    this.socialMedia,
    this.logoUrl,
    required this.createdAt,
  });

  factory Company.fromJson(Map<String, dynamic> json) {
    return Company(
      id: json['id'],
      name: json['name'] ?? '',
      address: json['address'],
      phone: json['phone'],
      emailSupport: json['email_support'],
      mapsLocation: json['maps_location'],
      socialMedia: json['social_media'] != null
          ? Map<String, dynamic>.from(json['social_media'])
          : null,
      logoUrl: json['logo_url'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'phone': phone,
      'email_support': emailSupport,
      'maps_location': mapsLocation,
      'social_media': socialMedia,
      'logo_url': logoUrl,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

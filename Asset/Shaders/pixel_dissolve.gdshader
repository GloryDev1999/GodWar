shader_type canvas_item;

// GodWar 3v3 Mobile - Pixel Dissolve / Teleport Disintegration Shader
// Dùng cho hiệu ứng dịch chuyển tức thời / lật mặt xoay người không giật đơ (giống samurai frame 39)

uniform float dissolve_amount : hint_range(0.0, 1.0) = 0.0;
uniform vec4 ember_color : source_color = vec4(1.0, 0.45, 0.1, 1.0);
uniform float pixel_size : hint_range(1.0, 8.0) = 2.0;

// Ma trận Bayer 4x4 cho Ordered Dithering chuẩn Pixel Art
float bayer4x4(vec2 uv_pixel) {
    int x = int(mod(uv_pixel.x / pixel_size, 4.0));
    int y = int(mod(uv_pixel.y / pixel_size, 4.0));
    int index = x + y * 4;
    
    // Ma trận chuẩn:
    //  0  8  2 10
    // 12  4 14  6
    //  3 11  1  9
    // 15  7 13  5
    float bayer[16] = float[16](
        0.0 / 16.0,  8.0 / 16.0,  2.0 / 16.0, 10.0 / 16.0,
       12.0 / 16.0,  4.0 / 16.0, 14.0 / 16.0,  6.0 / 16.0,
        3.0 / 16.0, 11.0 / 16.0,  1.0 / 16.0,  9.0 / 16.0,
       15.0 / 16.0,  7.0 / 16.0, 13.0 / 16.0,  5.0 / 16.0
    );
    return bayer[index];
}

void fragment() {
    vec4 col = texture(TEXTURE, UV);
    if (col.a < 0.05) {
        discard;
    }
    
    if (dissolve_amount > 0.001) {
        vec2 pixel_coord = UV / TEXTURE_PIXEL_SIZE;
        float threshold = bayer4x4(pixel_coord);
        
        // Scanline slice jitter nhẹ
        float slice = sin(pixel_coord.y * 0.8 + TIME * 30.0);
        float jitter_threshold = threshold + slice * 0.15 * dissolve_amount;
        
        if (dissolve_amount > jitter_threshold) {
            discard; // Rụng pixel
        } else if (dissolve_amount > jitter_threshold - 0.12) {
            // Viền lửa tàn tro chớp sáng trước khi tan rã
            col.rgb = mix(col.rgb, ember_color.rgb, 0.85);
        }
    }
    
    COLOR = col;
}

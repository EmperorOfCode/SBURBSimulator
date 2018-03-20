
uniform sampler2D spiro_tex;
uniform float session_rotation;
uniform float session_size;
uniform int land_count;

varying vec2 v_uv;

const int pixelsize = 512;
const float PI = 3.1415926535897932384626433832795;

vec4 alpha_mix(vec4 source, vec4 destination, float mult) {
    //source.a *= mult;
    //return destination * (1.0 - source.a) + source;
    return mix(destination, source, source.a * mult);
}

vec4 centred_circle(vec4 col, float radius, float dist, float dist_max, vec4 colour) {
    if (dist < radius && dist_max >= radius) {
        return alpha_mix(colour, col, 1.0);
    }
    return col;
}

vec4 centred_circle_thick(vec4 col, float radius, float thickness, float dist, vec4 colour) {
    if (dist >= radius && dist < (radius + thickness)) {
        return alpha_mix(colour, col, 1.0);
    }
    return col;
}

vec4 halo_circle(vec4 col, float inner, float outer, float dist, vec4 inner_col, vec4 outer_col) {
    if (dist < outer && dist > inner) {
        return alpha_mix(mix(inner_col, outer_col, (dist - inner) / (outer - inner)), col, 1.0);
    }
    return col;
}

vec4 spiro(vec4 in_col, vec2 centre, float size, float rad_inner, float rad_outer, float rotation, vec4 colour, float mip) {
    vec2 diff = (v_uv - centre) / (size * 0.5);
    float dist = length(diff);

    if (v_uv.x <= centre.x - size * 0.5 || v_uv.x >= centre.x + size * 0.5 || v_uv.y <= centre.y - size * 0.5 || v_uv.y >= centre.y + size * 0.5) {
        return in_col;
    }
    //if (dist > 1.1) { return in_col; }

    float c = cos(rotation);
    float s = sin(rotation);

    vec2 rotated = vec2(diff.x * c - diff.y * s, diff.x * s + diff.y * c);
    rotated = (rotated + 1.0) * 0.5;

    vec4 col = texture2D(spiro_tex, rotated, mip) * colour;

    if (rad_outer < 1.0 && dist > rad_outer) {
        col.a = mix(col.a, 0.0, clamp((dist - rad_outer) / 0.025, 0.0,1.0));
    } else if (rad_inner > 0.0 && dist < rad_inner) {
        col.a = mix(col.a, 0.0, clamp((rad_inner - dist) / 0.025, 0.0,1.0));
    }

    return alpha_mix(col, in_col, 1.0);
}

vec4 circle(vec4 col, vec2 centre, float size, vec4 colour) {
    vec2 diff = (v_uv - centre) / (size * 0.5);
    float dist = length(diff);

    if (dist <= 1.0) {
        return colour;
    }
    return col;
}

vec4 crescent(vec4 col, vec2 centre, float size, float angle, vec4 colour) {
    vec2 diff = (v_uv - centre) / (size * 0.5);
    float dist = length(diff);

    if (dist <= 1.0) {
        vec2 cres = centre + vec2(sin(angle), cos(angle)) * size * 0.16;
        vec2 cresdiff = (v_uv - cres) / (size * 0.5 * 0.80);
        float cresdist = length(cresdiff);

        if (cresdist > 1.0) {
            return colour;
        }
    }
    return col;
}

void main() {
    float pixel = 1.0 / float(pixelsize);
    vec3 offset = vec3(-1,0,1) * pixel;

    vec4 col = vec4(1.0,1.0,1.0,0.0);

    float dist = length((v_uv - 0.5) * 2.0);

    float dist_l = length((v_uv + offset.xy - 0.5) * 2.0);
    float dist_r = length((v_uv + offset.zy - 0.5) * 2.0);
    float dist_u = length((v_uv + offset.yx - 0.5) * 2.0);
    float dist_d = length((v_uv + offset.yz - 0.5) * 2.0);

    float dist_max = max(max(dist_l, dist_r), max(dist_u, dist_d));
    float dist_min = min(min(dist_l, dist_r), min(dist_u, dist_d));

    float skaia_scale = (0.5 + session_size * 0.5);
    float outer_scale = (0.25 + session_size * 0.75);

    col = halo_circle(col, outer_scale - 0.1, outer_scale, dist, vec4(1.0,1.0,1.0,0.4), vec4(1.0,1.0,1.0,0.0)); // edge halo

    col = centred_circle(col, outer_scale - 0.15 * (0.8 + 0.2 * outer_scale), dist, dist_max, vec4(1.0,1.0,1.0,0.45)); // outer edge
    col = centred_circle(col, session_size * 0.58, dist, dist_max, vec4(1.0,1.0,1.0,1.0)); // veil
    col = centred_circle_thick(col, session_size * 0.58 + 0.01, 3.75 * pixel, dist, vec4(1.0,1.0,1.0,1.0)); // veil outer
    col = centred_circle(col, skaia_scale * 0.1, dist, dist_max, vec4(1.0,1.0,1.0,1.0)); // skaia edge

    col = spiro(col, vec2(0.5, 0.5), skaia_scale * 0.075, 0.0, 0.71, session_rotation*4.0, vec4(25.0,25.0,25.0,2.5), 0.0); // skaia inner
    col = spiro(col, vec2(0.5, 0.5), skaia_scale * 0.1, 0.75, 0.95, -session_rotation, vec4(1.0,1.0,1.0,1.5), 0.0); // skaia outer

    // prospit and derse objects
    float prospit_dist = skaia_scale * 0.05 + 0.03;
    float prospit_rot = session_rotation + (PI * 0.5) + (PI / float(land_count));
    float derse_dist = session_size * 0.29 + 0.03;
    float derse_rot = -session_rotation * 0.5;

    col = circle(col, vec2(cos(derse_rot) * derse_dist + 0.5, sin(derse_rot) * derse_dist + 0.5), 10.0 * pixel, vec4(1.0,1.0,1.0,1.0));
    //col = crescent(col, vec2(cos(prospit_rot) * prospit_dist + 0.5, sin(prospit_rot) * prospit_dist + 0.5), 12.0 * pixel, -prospit_rot, vec4(1.0,1.0,1.0,1.0));
    col = circle(col, vec2(cos(prospit_rot) * prospit_dist + 0.5, sin(prospit_rot) * prospit_dist + 0.5), 10.0 * pixel, vec4(1.0,1.0,1.0,1.0));

	gl_FragColor = col;
	//gl_FragColor = texture2D(spiro_tex, v_uv);
}

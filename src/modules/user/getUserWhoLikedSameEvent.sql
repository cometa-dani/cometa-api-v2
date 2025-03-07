-- Start a transaction
BEGIN;

-- Deallocate all prepared statements
DEALLOCATE ALL;

-- Select event likes excluding the logged-in user and their accepted friendships
SELECT
  "public"."EventLike"."id",
  "public"."EventLike"."event_id",
  "public"."EventLike"."user_id",
  "public"."User"."id" AS "user_id",
  "public"."User"."created_at" AS "user_created_at",
  "public"."User"."updated_at" AS "user_updated_at",
  "public"."User"."email" AS "user_email",
  "public"."User"."phone" AS "user_phone",
  "public"."User"."username" AS "user_username",
  "public"."User"."name" AS "user_name",
  "public"."User"."biography" AS "user_biography",
  "public"."User"."birthday" AS "user_birthday",
  "public"."User"."interests"::text[] AS "user_interests",
  "public"."User"."activate_notifications" AS "user_activate_notifications",
  "public"."User"."current_location" AS "user_current_location",
  "public"."User"."home_town" AS "user_home_town",
  "public"."User"."languages" AS "user_languages",
  "public"."User"."height" AS "user_height",
  "public"."User"."weight" AS "user_weight",
  "public"."User"."favorite_sports" AS "user_favorite_sports",
  "public"."User"."music" AS "user_music",
  "public"."User"."looking_for"::text AS "user_looking_for",
  "public"."User"."occupation" AS "user_occupation",
  "public"."User"."education_level"::text AS "user_education_level",
  "public"."User"."relationship_status"::text AS "user_relationship_status",
  "public"."User"."pets" AS "user_pets",
  "public"."User"."smoking" AS "user_smoking",
  "public"."User"."drinking" AS "user_drinking",
  "public"."User"."ethnicity"::text AS "user_ethnicity",
  "public"."User"."children" AS "user_children",
  "public"."User"."company" AS "user_company",
  "public"."User"."verified" AS "user_verified",
  "public"."User"."gender"::text AS "user_gender",
  "public"."User"."exercise_frequency"::text AS "user_exercise_frequency",
  "public"."User"."uid" AS "user_uid",
  "public"."UserPhoto"."id" AS "photo_id",
  "public"."UserPhoto"."created_at" AS "photo_created_at",
  "public"."UserPhoto"."updated_at" AS "photo_updated_at",
  "public"."UserPhoto"."url" AS "photo_url",
  "public"."UserPhoto"."placeholder" AS "photo_placeholder",
  "public"."UserPhoto"."order" AS "photo_order",
  "public"."UserPhoto"."user_id" AS "photo_user_id",
  "public"."Friendship"."status" AS "outgoing_friendship_status",
  "public"."Friendship"."status" AS "incoming_friendship_status"
FROM
  "public"."EventLike"
  JOIN "public"."User" ON "public"."EventLike"."user_id" = "public"."User"."id"
  LEFT JOIN "public"."UserPhoto" ON "public"."User"."id" = "public"."UserPhoto"."user_id" AND "public"."UserPhoto"."order" = 0
  LEFT JOIN "public"."Friendship" AS "outgoingFriendships" ON "public"."User"."id" = "outgoingFriendships"."sender_id" AND "outgoingFriendships"."receiver_id" = $1
  LEFT JOIN "public"."Friendship" AS "incomingFriendships" ON "public"."User"."id" = "incomingFriendships"."receiver_id" AND "incomingFriendships"."sender_id" = $1
WHERE
  "public"."EventLike"."event_id" = $2
  AND "public"."EventLike"."user_id" != $1
  AND NOT EXISTS (
    SELECT 1
    FROM "public"."Friendship"
    WHERE (
      ("public"."Friendship"."receiver_id" = $1 AND "public"."Friendship"."sender_id" = "public"."EventLike"."user_id" AND "public"."Friendship"."status" = 'ACCEPTED')
      OR ("public"."Friendship"."sender_id" = $1 AND "public"."Friendship"."receiver_id" = "public"."EventLike"."user_id" AND "public"."Friendship"."status" = 'ACCEPTED')
    )
  )
LIMIT $3 OFFSET $4;

-- Commit the transaction
COMMIT;

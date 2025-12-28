import UserAvatar from "@/app/components/navigation/UserAvatar";
import { auth } from "@/auth";
import { getUser } from "@/lib/actions/user.action";
import { RouteParams } from "@/types/global";
import { notFound } from "next/navigation";
import ProfileLink from "../components/ProfileLink";
import dayjs from "dayjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Stats from "../components/Stats";
import { argv0 } from "process";

const Profile = async ({ params }: RouteParams) => {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const loggedInUser = await auth();
  const { success, data, error } = await getUser({ userId: parseInt(id) });

  if (!success) {
    return (
      <div>
        <div className="h1-bold text-dark100_light900">{error?.message}</div>
      </div>
    )
  }

  const { user, totalQuestions, totalAnswers } = data!;

  return (
    <>
      <section className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <UserAvatar
            id={user.id.toString()}
            name={user.name}
            imageUrl={user.image}
            className="size-35 rounded-full object-cover"
            fallbackClassName="text-6xl fond-bolder"
          />
          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">{user.name}</h2>
            <p className="paragraph-regular text-dark200_light800">@{user.username}</p>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
            {user.portfolio && <ProfileLink
              imgUrl="/icons/link.svg"
              href={user.portfolio}
              title="Portfolio"
            />}
            {user.location && <ProfileLink
              imgUrl="/icons/location.svg"
              title="Location"
            />}
            <ProfileLink
              imgUrl="/icons/calendar.svg"
              title={dayjs(user.created_at).format("MMMM YYYY")}
            />

            {user.bio && (
              <p className="paragraph-regular text-dark400_light800 mt-8">{user.bio}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3" >
          {loggedInUser?.user?.id === id && (
            <Link href="/profile/edit" >
              <Button className="paragraph-medium btn-secondary text-dark300_light900 min-h-12 min-w-44 px-4 py-3">Edit Profile</Button>
            </Link>
          )}
        </div>
      </section>

      <Stats
        totalQuestions={totalQuestions}
        totalAnswers={totalAnswers}
        badges={{
          GOLD: 0,
          SILVER: 0,
          BRONZE: 0,
        }}
      ></Stats>
    </>
  );
};
export default Profile;

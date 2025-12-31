import {
  ActionContentType,
  ActionType,
  InteractionCreate,
} from "@/types/interaction";
import action from "../handlers/action";
import { CreateInteractionSchema } from "../validations";
import handleError from "../handlers/error";
import { ActionResponse, ErrorResponse, ExtendedUser } from "@/types/global";
import { apiInteraction } from "../api/apiInteraction";

interface CreateInteractionParams {
  contentType: ActionContentType;
  targetId: number;
  actionType: ActionType;
}

export const createInteraction = async (
  params: CreateInteractionParams
): Promise<ActionResponse> => {
  const validationResult = await action({
    params,
    schema: CreateInteractionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    handleError(validationResult) as ErrorResponse;
  }

  const { contentType, targetId, actionType  } = params;

  const sessionUserId = (validationResult.session?.user as ExtendedUser)?.id;
  if (!sessionUserId) {
    return {
      success: false,
    };
  }

  try {
    const interaction: InteractionCreate = {
      user_id: parseInt(sessionUserId),
      content_type: contentType,
      target_id: targetId,
      action_type: actionType,
    };

    const { success, error } = await apiInteraction.create(interaction);
    return {
      success: success,
      error: error,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
